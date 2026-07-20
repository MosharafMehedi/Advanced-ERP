<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class EmployeeDocumentController extends Controller
{

    public function index(Request $request)
    {
        $employeesWithDocs = Employee::whereHas('documents')
            ->withCount('documents')
            ->latest()
            ->paginate(10);

        $allEmployees = Employee::select('id', 'full_name', 'employee_id')->get();

        return Inertia::render('EmployeeDocuments/Index', [
            'employees' => $employeesWithDocs,
            'allEmployees' => $allEmployees
        ]);
    }

    public function show(string $employeeId)
    {
        $employee = Employee::with(['documents' => function($query) {
            $query->latest();
        }])->findOrFail($employeeId);

        return Inertia::render('EmployeeDocuments/Show', [
            'employee' => $employee
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id'   => 'required|exists:employees,id',
            'document_type' => 'required|string|max:100',
            'title'         => 'required|string|max:255',
            'file'          => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
            'expiry_date'   => 'nullable|date',
            'notes'         => 'nullable|string',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('public/documents/' . $request->employee_id);
            $fileType = $file->getClientOriginalExtension();

            EmployeeDocument::create([
                'employee_id'   => $request->employee_id,
                'document_type' => $request->document_type,
                'title'         => $request->title,
                'file_path'     => $path,
                'file_type'     => $fileType,
                'expiry_date'   => $request->expiry_date,
                'status'        => 'Valid',
                'notes'         => $request->notes,
            ]);

            return redirect()->back()->with('success', 'Document uploaded successfully.');
        }

        throw ValidationException::withMessages(['file' => 'File upload failed.']);
    }


    public function update(Request $request, string $id)
    {
        $document = EmployeeDocument::findOrFail($id);

        $request->validate([
            'document_type' => 'required|string|max:100',
            'title'         => 'required|string|max:255',
            'file'          => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
            'expiry_date'   => 'nullable|date',
            'status'        => 'required|in:Valid,Expired,Pending_Verification',
            'notes'         => 'nullable|string',
        ]);

        $data = $request->only(['document_type', 'title', 'expiry_date', 'status', 'notes']);

        if ($request->hasFile('file')) {
            if (Storage::exists($document->file_path)) {
                Storage::delete($document->file_path);
            }

            $file = $request->file('file');
            $data['file_path'] = $file->store('public/documents/' . $document->employee_id);
            $data['file_type'] = $file->getClientOriginalExtension();
        }

        $document->update($data);

        return redirect()->back()->with('success', 'Document updated successfully.');
    }

    public function destroy(string $id)
    {
        $document = EmployeeDocument::findOrFail($id);

        if (Storage::exists($document->file_path)) {
            Storage::delete($document->file_path);
        }

        $document->delete();

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }

    public function download(string $id)
    {
        $document = EmployeeDocument::findOrFail($id);

        if (!Storage::exists($document->file_path)) {
            abort(404, 'File not found on server.');
        }

        return Storage::download($document->file_path, $document->title . '.' . $document->file_type);
    }

    public function view(string $id)
    {
        $document = EmployeeDocument::findOrFail($id);

        if (!Storage::exists($document->file_path)) {
            abort(404, 'File not found on server.');
        }

        return Storage::response($document->file_path);
    }
}